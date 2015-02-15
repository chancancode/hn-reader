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

exec "Removing existing fixtures...", "rm -rf tests/fixtures/*"

download_section "news"
download_section "newest"
download_section "show"
download_section "ask"
download_section "jobs"

puts "Downloading fixtures for not-found page..."

File.open("tests/fixtures/not-found.html", "w+") do |f|
  raw, _ = fetch_page(nil, "ask?p=9999")
end

puts "Populating JSON fixtures from test results..."

page = Capybara.current_session

page.visit "http://localhost:4200/tests?nocontainer&nojshint&module=Story%20extractor"

page.evaluate_script "LiveReload.shutDown()"

page.all(:css, ".test-diff pre").each do |el|
  diff = el.text

  if file = diff[/"<STUB `(.+)`>"/, 1]
    print "  Populating #{file}... "

    File.open(file, 'w+') do |f|
      f.print JSON.pretty_generate(JSON.parse(diff.gsub(/"<STUB .+>"/, '').strip))
    end

    puts "DONE"
  end
end

page.visit "http://localhost:4200/tests/index.html?nocontainer&nojshint&module=Story%20extractor"

failed = page.all(:css, ".fail").count

if failed > 0
  puts "WARNING: found #{failed} tests!"
end

puts "All done!"
