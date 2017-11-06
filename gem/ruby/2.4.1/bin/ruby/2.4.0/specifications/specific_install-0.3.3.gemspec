# -*- encoding: utf-8 -*-
# stub: specific_install 0.3.3 ruby lib

Gem::Specification.new do |s|
  s.name = "specific_install".freeze
  s.version = "0.3.3"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Roger Pack".freeze, "Zander Hill".freeze]
  s.date = "2017-01-23"
  s.description = "rubygems plugin that allows you you to install a gem from from its github repository (like 'edge'), or from an arbitrary URL".freeze
  s.email = ["rogerdpack@gmail.com".freeze, "zander@civet.ws".freeze]
  s.homepage = "https://github.com/rdp/specific_install".freeze
  s.licenses = ["MIT".freeze]
  s.rubyforge_project = "[none]".freeze
  s.rubygems_version = "2.6.11".freeze
  s.summary = "rubygems plugin that allows you you to install a gem from from its github repository (like 'edge'), or from an arbitrary URL".freeze

  s.installed_by_version = "2.6.11" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<rspec>.freeze, [">= 0"])
      s.add_development_dependency(%q<sane>.freeze, [">= 0"])
      s.add_development_dependency(%q<bundler>.freeze, ["~> 1.3"])
      s.add_development_dependency(%q<rake>.freeze, [">= 0"])
      s.add_development_dependency(%q<simplecov>.freeze, [">= 0"])
      s.add_development_dependency(%q<simplecov-vim>.freeze, [">= 0"])
    else
      s.add_dependency(%q<rspec>.freeze, [">= 0"])
      s.add_dependency(%q<sane>.freeze, [">= 0"])
      s.add_dependency(%q<bundler>.freeze, ["~> 1.3"])
      s.add_dependency(%q<rake>.freeze, [">= 0"])
      s.add_dependency(%q<simplecov>.freeze, [">= 0"])
      s.add_dependency(%q<simplecov-vim>.freeze, [">= 0"])
    end
  else
    s.add_dependency(%q<rspec>.freeze, [">= 0"])
    s.add_dependency(%q<sane>.freeze, [">= 0"])
    s.add_dependency(%q<bundler>.freeze, ["~> 1.3"])
    s.add_dependency(%q<rake>.freeze, [">= 0"])
    s.add_dependency(%q<simplecov>.freeze, [">= 0"])
    s.add_dependency(%q<simplecov-vim>.freeze, [">= 0"])
  end
end
