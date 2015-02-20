gem 'nokogiri'
gem 'capybara'
gem 'json'

require 'open-uri'
require 'nokogiri'
require 'capybara'
require 'json'

Capybara.register_driver :chrome do |app|
  Capybara::Selenium::Driver.new(app, browser: :chrome)
end

Capybara.default_driver = :chrome

$items = []

def exec(comment, command)
  puts comment if comment
  print "  Executing `#{command}`... "
  system command

  if $?.exitstatus == 0
    puts "DONE"
  else
    puts "  ERROR! Command `#{command}` exited with non-zero status: #{$?.exitstatus}"
    print "  Continue? "
    exit $?.exitstatus unless gets.strip.upcase == "Y"
  end
end

def fetch_page(section, page = nil)
  page ||= section

  print "  Downloading /#{page}... "

  raw = open("https://news.ycombinator.com/#{page}").read

  puts "DONE"

  print "  Parsing /#{page}... "

  parsed = Nokogiri::HTML.parse(raw)

  puts "DONE"

  [raw, parsed]
end

def download_page(section, page = nil)
  raw, parsed = fetch_page section, page

  if page
    filename = page.split('=')[1].to_i.to_s
  else
    parsed.css("a[href^='item?id=']").each_with_index do |link, i|
      break if i >= 10
      $items << link['href'].gsub('item?id=', '').to_i
    end

    if section == "newest"
      filename = "newest"
    else
      filename = "1"
    end
  end

  print "  Saving tests/fixtures/#{section}/#{filename}.html... "

  File.open("tests/fixtures/#{section}/#{filename}.html", "w+") do |f|
    f.print raw
  end

  puts "DONE"

  print "  Creating a stub for tests/fixtures/#{section}/#{filename}.json... "

  File.open("tests/fixtures/#{section}/#{filename}.json", "w+") do |f|
    f.print %{"<STUB `tests/fixtures/#{section}/#{filename}.json`>"}
  end

  puts "DONE"

  if next_page_link = parsed.xpath("//a[text()='More']").first
    next_page_link['href']
  end
end

def download_section(section)
  exec "Downloading fixtures for '/#{section}'...", "mkdir tests/fixtures/#{section}"

  # Page 1
  next_page = download_page section

  # Page 2-5
  4.times do
    if next_page
      next_page = download_page section, next_page
    end
  end
end

def download_item(item)
  raw, _ = fetch_page nil, "item?id=#{item}"

  print "  Saving tests/fixtures/item/#{item}.html... "

  File.open("tests/fixtures/item/#{item}.html", "w+") do |f|
    f.print raw
  end

  puts "DONE"

  print "  Creating a stub for tests/fixtures/item/#{item}.json... "

  File.open("tests/fixtures/item/#{item}.json", "w+") do |f|
    f.print %{"<STUB `tests/fixtures/item/#{item}.json`>"}
  end

  puts "DONE"
end

exec "Removing existing fixtures...", "rm -rf tests/fixtures/*"

download_section "news"
download_section "active"
download_section "newest"
download_section "show"
download_section "ask"
download_section "jobs"

puts "Downloading fixtures for filter not-found page..."

File.open("tests/fixtures/not-found.html", "w+") do |f|
  raw, _ = fetch_page(nil, "ask?p=9999")
  f.print raw
end

exec "Downloading item fixtures...", "mkdir tests/fixtures/item"

$items.uniq!
$items.sort!
$items.each &method(:download_item)

puts "Downloading fixtures for item not-found page..."

File.open("tests/fixtures/item/not-found.html", "w+") do |f|
  raw, _ = fetch_page(nil, "item?id=99999999")
  f.print raw
end

puts "Populating JSON fixtures from test results..."

page = Capybara.current_session

page.visit "http://localhost:4200/tests?nocontainer&nojshint&module=Story%20extractor"

page.evaluate_script "LiveReload.shutDown()"

sleep 5

def properly_quote_string(string)
  # This is what QUnit does. We need to try much harder than that to make it
  # valid JSON...
  #
  #	function quote( str ) {
	#	  return "\"" + str.toString().replace( /"/g, "\\\"" ) + "\"";
	# }
  #
  JSON.generate(string[1...-1].gsub("\\\"", "\""), quirks_mode: true)
end

page.all(:css, ".test-diff pre").each do |el|
  diff = el.text

  if file = diff[/"<STUB `(.+)`>"/, 1]
    print "  Populating #{file}... "

    File.open(file, 'w+') do |f|
      f.print el.native.text
        .gsub(/"<STUB .+>"/, '')
        .gsub(/"(?:[^\\"]|\\.)*"/) { |str| properly_quote_string(str) }
        .strip
    end

    puts "DONE"
  end
end

page.all(:css, ".test-message").each do |el|
  if file = el.text[/<ERROR `(.+)`>/, 1]
    exec "WARNING: removing dead item `#{file}`", "rm #{file}"
  end
end

page.visit "http://localhost:4200/tests/index.html?nocontainer&nojshint&module=Story%20extractor"

sleep 5

failed = page.find(:css, ".result .failed").text.to_i

if failed > 0
  puts "WARNING: found #{failed} failing tests!"
  gets
end

puts "All done!"
