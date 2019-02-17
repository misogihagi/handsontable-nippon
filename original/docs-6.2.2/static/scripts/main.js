function isIE() { return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null))); }

function isEdge() { return /Edge/.test(navigator.userAgent) }

(function() {
  if (isIE()) {
    return;
  }
  var tracking = location.hash !== '' && location.hash !== '#';
  var block = false;

  if (tracking) {
    $(window).on('scroll', function() {
      if (!block) {
        block = true;

        var rect = document.getElementById(location.hash.replace('#', '')).getBoundingClientRect();

        window.scrollTo(0, window.scrollY + rect.top - 120);
      }
    });
  }
}())

$(function () {
  var d = document;
  var w = window;
  var $$ = function(selector) {
    return d.querySelectorAll(selector);
  };

  jQuery.fx.off = true;

  // Anchor fix
  if (!isIE()) {
    $(window).on('popstate', function(event) {
      var hash = (event.originalEvent.state || {}).previousHash;

      if (hash) {
        var rect = document.getElementById(hash.replace('#', '')).getBoundingClientRect();

        window.scrollTo(0, window.scrollY + rect.top - 120);
      }
    });

    $(document.body).on('click', 'a[href*="#"]', function(event) {
      if (location.pathname === event.target.pathname) {
        event.preventDefault();

        var rect = document.getElementById(event.target.hash.replace('#', '')).getBoundingClientRect();

        history.pushState({previousHash: event.target.hash}, '', event.target.pathname + event.target.hash);

        window.scrollTo(0, window.scrollY + rect.top - 120);
      }
    });
  }
  // END: Anchor fix

  // Tabs
  d.addEventListener('click', function(event) {
    var target = event.target;
    var firstTab = $$('.tabs')[0];
    var activeSection;

    if (target.id && /^tab\-./.test(target.id) && !/^tab\-content\-./.test(target.id)) {
      var tabGroups = $$('.tabs-alternative').length ? $$('.tabs-alternative') : firstTab.querySelectorAll('.tabs');

      for (var i = 0; i < tabGroups.length; i += 1) {
        if (tabGroups[i].contains(target)) {
          var tabsContent = tabGroups[i].querySelectorAll('[id^=tab-content-]');

          for (var j = 0; j < tabsContent.length; j += 1) {
            if (tabsContent[j].classList.contains('active')) {
              tabsContent[j].classList.remove('active');
            }
            if (tabsContent[j].hasAttribute('aria-hidden')) {
              tabsContent[j].setAttribute('aria-hidden', 'true');
            }
          }

          var tabs = tabGroups[i].querySelectorAll('[id^=tab-]');

          for (var j = 0; j < tabs.length; j += 1) {
            if (tabs[j].classList.contains('active')) {
              tabs[j].classList.remove('active');
            }
            if (tabs[j].hasAttribute('aria-selected')) {
              tabs[j].setAttribute('aria-selected', 'false');
            }
            if (tabs[j].hasAttribute('aria-hidden')) {
              tabs[j].setAttribute('aria-hidden', 'true');
            }
          }

          break;
        }
      }

      for (var k = 0; k < firstTab.children.length; k += 1) {
        if (firstTab.children[k].className === 'active') {
          activeSection = firstTab.children[k];
        }
      }

      var contentId = 'tab-content-' + target.id.replace('tab-', '');
      var contentElement = activeSection ? activeSection.querySelector('#' + contentId) : d.getElementById(contentId);
      var contentToActivate = contentElement.dataset.tabForward ? $('tab-content-' + contentElement.dataset.tabForward) : contentElement;

      target.classList.add('active');
      contentToActivate.classList.add('active');

      if (target.hasAttribute('aria-selected')) {
        target.setAttribute('aria-selected', 'true');
      }
      if (contentToActivate.hasAttribute('aria-hidden')) {
        contentToActivate.setAttribute('aria-hidden', 'false');
      }

      var event;

      try {
        event = new Event('tab-content-active');
      } catch (ex) {
        event = document.createEvent('Event');
        event.initEvent('tab-content-active', true, true);
      }
      contentElement.dispatchEvent(event);
    }
  });

  function getLocationOrigin() {
    return location.protocol + '//' + location.host + location.pathname;
  }
  // end

  // Search Items
  $('#search-form').on('keyup', onSearchKeyUp);
  document.querySelector('#search-form').focus();

  // Toggle when click an item element
  $('.navigation').on('click', '.title', function (event) {
    var title = $(this);
    var target = $(event.target);

    if (event.target.getAttribute('href') === '#') {
      if (target.parent().hasClass('group-title')) {
        var els = title.parent().find('.title.extensible:not(.group-title)');

        if (els.eq(0).css('display') === 'none') {
          title.parent().find('.title.extensible:not(.group-title)').css('display', 'block');
        } else {
          title.parent().find('.title.extensible:not(.group-title)').css('display', 'none');
          title.parent().find('.itemMembers').hide();
        }

      } else if (target.parent().hasClass('extensible')) {
        title.parent().find('.itemMembers[data-list-id=' + (title.data('list-id') || title.parent().data('name')) + ']').toggle();
      }
    }
    event.preventDefault();

    return false;
  });
  $('.navigation a:not(.link-header)').on('click', function() {
    setTimeout(updateNav, 100);
  });

  updateNav(true);
  hideJSFiddleButton();

  var breadcrumbs = buildBreadcrumbs();
  $('div.breadcrumbs').eq(0).html(breadcrumbs);

  /**
   * Outdated version notification
   */
  if (hotVersion !== _docVersions[0]) {
    $('#outdated-version')
      .html('<strong>Please note:</strong> You\'re viewing an older version of Handsontable. Switch to the latest version.')
      .removeClass('hidden');
  }

  // disqus code
  if (config.disqus) {
    $(window).on('load', function () {
      var disqusShortname = config.disqus,
        dsq = document.createElement('script'),
        s;

      dsq.type = 'text/javascript';
      dsq.async = true;
      dsq.src = '//' + disqusShortname + '.disqus.com/embed.js';

      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
      s = document.createElement('script');
      s.async = true;
      s.type = 'text/javascript';
      s.src = '//' + disqusShortname + '.disqus.com/count.js';
      document.getElementsByTagName('BODY')[0].appendChild(s);
    });
  }

  // mobile hamburger
  $('#mobile-nav-menu').on('ontouchstart' in window ? 'touchstart' : 'click', function(event) {
    var element = $('#mobile-nav-menu').parent();

    element.toggleClass('mobile-active');
    element.toggleClass('mobile-inactive');
  });
  // end

  // dynamic stats
  function updateElements(data) {
    var elements = document.querySelectorAll('[data-bind]');

    for (var i = 0, len = elements.length; i < len; i++) {
      var prop = elements[i].dataset.bind;

      if (data[prop] !== void 0) {
        elements[i].innerText = data[prop];
      }
    }
  }

  function updateVariables(callback) {
    axios({
      url: 'https://stats.handsontable.com/stats'
    }).then(function(resp) {
      var data = resp.data;

      data.lastUpdate = Date.now();

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      callback(data);
    });
  }

  var STORAGE_KEY = 'dynamic-variables';
  var variables = localStorage.getItem(STORAGE_KEY);

  if (typeof variables === 'string' && variables) {
    var data = null;

    try {
      data = JSON.parse(variables);
    } catch(ex) {}

    if (data === null) { // JSON is broken - get data from backend.
      localStorage.removeItem(STORAGE_KEY);

      updateVariables(function(data) {
        updateElements(data);
      });

    } else if (Date.now() - data.lastUpdate > 3600 * 8 * 1000) { // Cached data are to old - get data from backend
      updateVariables(function(data) {
        updateElements(data);
      });

    } else { // Update elements based on cached values
      updateElements(data);
    }

  } else {
    // Variables are not exist in the cached - get data from backend.
    updateVariables(function(data) {
      updateElements(data);
    });
  }
  // end
});

function hideJSFiddleButton() {
  var buttons = $('.jsFiddleLink');

  for (var i = 0, len = buttons.length; i < len; i += 1) {
    var button = buttons[i];

    if (isIE() || isEdge()) {
      button.style.display = 'none';
    }
  }
}

function updateNav(scroll) {
  // Show an item related a current documentation automatically
  var filename = $('.page-title').data('filename').replace(/\.[a-z]+$/, '').replace(/_$/, '');
  var $currentItem = $('.navigation .item[data-name="' + filename + '"]:not(.multiple):eq(0), .navigation .item .extensible[data-name="' + filename + '"]:eq(0)');
  var $currentSubItem = $('.navigation .sub-item[data-name="' + filename + '"]:eq(0)');
  var $current;

  //get the current method element
  var urlElement = window.location.href.split('/');
  urlElement = urlElement[urlElement.length - 1].replace('.html', '');
  var $currentMethod = $currentItem.find('li[data-name="' + urlElement + '"]:eq(0)');

  if ($currentItem.length) {
    if ($currentItem.eq(0).hasClass('inner')) {
      $currentItem.eq(0).parent().find('.title.extensible:not(.group-title)').css('display', 'block');
      $currentItem.eq(0).parent().find('.itemMembers[data-list-id=' + filename + ']').css('display', 'block');
      $currentMethod = $currentItem.eq(0).parent().find('.itemMembers[data-list-id=' + filename + '] li[data-name="' + urlElement + '"]:eq(0)');
    } else {
      $currentItem
        .find('.itemMembers')
        .show();
    }
    $current = $currentItem;

  } else if ($currentSubItem.length) {
    $currentSubItem
      .parent('.itemMembers')
      .show();
    $current = $currentSubItem;
  }
  if ($currentMethod.length) {
    $current = $currentMethod;
  }
  $('.navigation a').removeClass('active-link');

  // Add the 'active-link' class to the active page
  if ($currentSubItem.length) {
    $currentSubItem.find('a').first().addClass('active-link');
  }

  // Add the 'active-link' class to the active method
  if ($currentMethod.length) {
    $currentMethod.find('a').first().addClass('active-link');
  }

  // Scroll to the currently selected element
  if (scroll && $current && $current.text().trim() !== 'Introduction') {
    setTimeout(function() {
      var scrollableNav = $('.navigation').find('ul.list').first();

      scrollableNav.scrollTop(scrollableNav.prop('scrollTop') + $current.position().top);
    }, 20);
  }

  return $current;
}

function onSearchKeyUp() {
  var value = $(this).val(),
    $el = $('.navigation'),
    $notFound = $('.sublist.not-found'),
    regexp;

  if (value) {
    regexp = new RegExp(value, 'i');
    $el.find('.list li, .itemMembers, .subheader, .sublist, .title.inner').hide();

    $el.find('.list li').each(function (i, v) {
      var $item = $(v);

      if ($item.hasClass('tutorial')) {
        return;
      }

      if ($item.data('name') && !$item.hasClass('multiple') &&
          (regexp.test($item.find('a').first().text()) || regexp.test($item.data('name')))) {
        $item.show();

        $item.closest('.itemMembers').show();
        $item.closest('.itemMembers').prevAll('.inner').eq(0).css('display', 'block');
        $item.closest('.item').show();
        $item.parents('.item').prevAll('p').first().show();
        $item.parents('.sublist').show();
      }
    });
    if ($('.sublist:not([style*="display: none"]), .tutorial:not([style*="display: none"])').length) {
      $notFound.hide();
    } else {
      $notFound.show();
    }
  } else {
    $el.find('.item, .sub-item, .itemMembers li, .subheader, .sublist').show();
    $el.find('.item .itemMembers').hide();
    $notFound.hide();
  }

  $el.find('.list').scrollTop(0);
}

function getDocUrl(docVersion) {
  return location.href.replace(/\/docs\/\d+\.\d+\.\d+(\-(beta|alpha)(\d+)?)?\//, '/docs/' + docVersion + '/');
}
function goTo(href) {
  location.href = href;
}

var _docVersions = [];

function docVersions(docVersions) {
  _docVersions = docVersions;
}

function getLatestHOTStableVersion() {
  var stable = _docVersions.filter(function(version) {
    return (Array.isArray(version) ? version[0] : version).match(/\d+\.\d+\.\d+/) ? true : false;
  });

  return stable.length ? stable[0] : _docVersions[0];
}

function buildBreadcrumbs() {
  var $activeLink = $('.active-link').eq(0),
    $activeLinkParent = $activeLink.parent(),
    $subtitle,
    $item,
    $subheader,
    $header,
    docsLink,
    breadcrumbs;

  var makeSpan = function (content) {
    return '<span>' + content + '</span>';
  };

  var makeHotVersion = function (currentHotVersion) {
    var lastVersion = null;

    var options = _docVersions.map(function(version) {
      var hotVersion = Array.isArray(version) ? version[0] : version;
      var minorMajor = hotVersion.split('.').splice(0, 2).join('.');
      var hotCeVersion = Array.isArray(version) ? version[1] : null;
      var option = '';

      if (lastVersion !== minorMajor) {
        if (lastVersion !== null) {
          option += '</optgroup>';
        }
        option += '<optgroup label="' + minorMajor + '.x">';
      }
      var versionLabel = hotVersion + (hotCeVersion ? ' (' + hotCeVersion + ')' : '');

      if (hotVersion === currentHotVersion) {
        option += '<option selected value="' + hotVersion + '">' + versionLabel + '</option>';
      } else {
        option += '<option value="' + hotVersion + '">' + versionLabel + '</option>';
      }
      lastVersion = minorMajor;

      return option;
    });
    options.push('</optgroup>');

    return '<span>' +
      '<select class="hot-chooser" onchange="goTo(getDocUrl(this.value))" selected="' + currentHotVersion + '">' +
      options.join('') +
      '</select>' +
      '</span>';
  };

  // links
  docsLink = document.createElement('a');
  docsLink.href = '/docs';
  docsLink.text = 'Handsontable';

  if ($('.source').size() > 0 || !$activeLink.length) {
    var filename = $('.page-title').data('filename').replace(/\.[a-z]+$/, '');

    breadcrumbs = docsLink.outerHTML
      + makeHotVersion(hotVersion)
      + makeSpan("Source: " + filename);

  } else if ($activeLink.parents("div.sublist.api").size() > 0) {
    $subtitle = $activeLinkParent.prevAll('span.subtitle').eq(0).filter(function () {
      return $activeLinkParent.parent()[0] === $(this).parent()[0];
    });

    $item = $activeLink.parents('li.item').eq(0);
    $subheader = $item.prevAll('p.subheader').eq(0);
    $header = $item.prevAll('p.header').eq(0);

    breadcrumbs = docsLink.outerHTML
      + makeHotVersion(hotVersion)
      + makeSpan($header.text())
      + makeSpan($subheader.text())
      + makeSpan($item.attr('data-name'))
      + makeSpan($subtitle.text())
      + makeSpan($activeLink.text());

  } else {
    $item = $activeLink.parents('li.item').eq(0);
    $item = $item.find('.title a');

    breadcrumbs = docsLink.outerHTML
      + makeHotVersion(hotVersion)
      + makeSpan($item.text())
      + makeSpan($activeLink.text());
  }

  return breadcrumbs;
}
