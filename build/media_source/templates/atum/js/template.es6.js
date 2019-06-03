/**
 * @copyright  Copyright (C) 2005 - 2018 Open Source Matters, Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

((Joomla, doc) => {
  'use strict';

  const storageEnabled = typeof Storage !== 'undefined';

  /**
   * Shrink or extend the logo, depending on sidebar
   *
   * @param {string} [change] is the sidebar 'open' or 'closed'
   *
   * @since   4.0.0
   */
  function changeLogo(change) {
    const logo = doc.querySelector('.logo');
    const isLogin = doc.querySelector('body.com_login');

    if (!logo || isLogin) {
      return;
    }

    const state = change
      || (storageEnabled && localStorage.getItem('atum-sidebar'));

    if (state === 'closed') {
      logo.classList.add('small');
    } else {
      logo.classList.remove('small');
    }
  }

  /**
   * Method that add a fade effect and transition on sidebar and content side
   * after login and logout
   *
   * @since   4.0.0
   */
  function fade(fadeAction, transitAction) {
    const sidebar = doc.querySelector('.sidebar-wrapper');
    const sidebarChildren = sidebar ? sidebar.children : [];
    const sideChildrenLength = sidebarChildren.length;
    const contentMain = doc.querySelector('.container-main');
    const contentChildren = contentMain ? contentMain.children : [];
    const contChildrenLength = contentChildren.length;

    for (let i = 0; i < sideChildrenLength; i += 1) {
      sidebarChildren[i].classList.add(`load-fade${fadeAction}`);
    }
    for (let i = 0; i < contChildrenLength; i += 1) {
      contentChildren[i].classList.add(`load-fade${fadeAction}`);
    }
    if (sidebar) {
      if (transitAction) {
        // Transition class depends on the width of the sidebar
        if (storageEnabled
          && localStorage.getItem('atum-sidebar') === 'closed') {
          sidebar.classList.add(`transit-${transitAction}-closed`);
          changeLogo('small');
        } else {
          sidebar.classList.add(`transit-${transitAction}`);
        }
      }
      sidebar.classList.toggle('fade-done', fadeAction !== 'out');
    }
    if (contentMain) {
      contentMain.classList.toggle('fade-done', fadeAction !== 'out');
    }
  }

  /**
   * toggle arrow icon between down and up depending on position of the nav header
   *
   * @param {string} [positionTop] set if the nav header positioned to the 'top' otherwise 'bottom'
   *
   * @since   4.0.0
   */
  function toggleArrowIcon(positionTop) {
    const navDropDownIcon = doc.querySelectorAll('.nav-item.dropdown span[class*="fa-angle-"]');
    const remIcon = (positionTop) ? 'fa-angle-up' : 'fa-angle-down';
    const addIcon = (positionTop) ? 'fa-angle-down' : 'fa-angle-up';

    if (!navDropDownIcon) {
      return;
    }

    navDropDownIcon.forEach((item) => {
      item.classList.remove(remIcon);
      item.classList.add(addIcon);
    });
  }

  /**
   * adjust color of svg logos
   *
   * @since   4.0.0
   */
  function changeSVGLogoColor() {
    const logoImgs = [].slice.call(document.querySelectorAll('.logo img'));

    logoImgs.forEach((img) => {
      const imgID = img.getAttribute('id');
      const imgClass = img.getAttribute('class');
      const imgURL = img.getAttribute('src');

      Joomla.request({
        url: imgURL,
        method: 'GET',
        onSuccess: (response) => {
          // Get the SVG tag, ignore the rest
          const parsedImg = new DOMParser().parseFromString(response, 'image/svg+xml');
          const svg = parsedImg.getElementsByTagName('svg')[0];

          // Add replaced image's ID to the new SVG
          if (imgID) {
            svg.setAttribute('id', imgID);
          }

          // Add replaced image's classes to the new SVG
          if (imgClass) {
            svg.setAttribute('class', `${imgClass} replaced-svg`);
          }

          // Remove any invalid XML tags as per http://validator.w3.org
          svg.removeAttribute('xmlns:a');

          // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
          if (!svg.hasAttribute('viewBox') && svg.hasAttribute('height') && svg.hasAttribute('width')) {
            svg.setAttribute('viewBox', `0 0 ${svg.getAttribute('height')} ${svg.getAttribute('width')}`);
          }

          // Replace image with new SVG
          img.parentElement.replaceChild(svg, img);
        },
      });
    });
  }

  /**
   * put elements that are too much in the header in a dropdown
   *
   * @param {integer} [visibleItems] the number of visible elements
   *
   * @since   4.0.0
   */

  function headerItemsInDropdown(visibleItems) {
    const headerWrapper = doc.querySelector('.header-items');
    const headerItems = [].slice.call(doc.querySelectorAll('.header-items > .header-item'));
    headerItems.reverse();

    if (headerItems.length > visibleItems) {
      if (!doc.querySelector('#header-more-items')) {
        const headerMoreItem = document.createElement('div');
        headerMoreItem.className = 'header-item-more d-flex';
        headerMoreItem.id = 'header-more-items';
        const headerItemContent = document.createElement('div');
        headerItemContent.className = 'header-item-content header-more footer-mobil-icon d-flex';
        const headerMoreBtn = document.createElement('button');
        headerMoreBtn.className = 'header-more-btn d-flex flex-column align-items-stretch';
        headerMoreBtn.setAttribute('type', 'button');
        headerMoreBtn.setAttribute('title', 'More Elements');
        const spanFa = document.createElement('span');
        spanFa.className = 'fa fa-ellipsis-h';
        spanFa.setAttribute('aria-hidden', 'true');
        const headerMoreMenu = document.createElement('div');
        headerMoreMenu.className = 'header-more-menu d-flex flex-wrap';

        headerMoreBtn.appendChild(spanFa);
        headerItemContent.appendChild(headerMoreBtn);
        headerMoreItem.appendChild(headerItemContent);
        headerMoreItem.appendChild(headerMoreMenu);
        headerWrapper.appendChild(headerMoreItem);

        headerMoreBtn.addEventListener('click', function () {
          headerMoreItem.classList.toggle('active');
        });
      }

      const headerMoreWrapper = headerWrapper.querySelector('#header-more-items .header-more-menu');
      const headerMoreItems = headerMoreWrapper.querySelectorAll('.header-item');
      let headerItemCounter = 0;

      headerItems.forEach(function (item) {
        headerItemCounter += 1;
        if (headerItemCounter > visibleItems && item.id !== 'header-more-items') {
          if (!headerMoreItems) {
            headerMoreWrapper.appendChild(item);
          } else {
            headerMoreWrapper.insertBefore(item, headerMoreItems[0]);
          }
        }
      });
    } else if (headerItems.length < visibleItems && doc.querySelector('#header-more-items')) {
      const headerMore = headerWrapper.querySelector('#header-more-items');
      let headerItemCounter = headerItems.length;
      const headerMoreItems = [].slice.call(headerMore.querySelectorAll('.header-item'));
      const headerAllItems = headerItems.length + headerMoreItems.length;

      headerMoreItems.forEach(function (item) {
        if (headerItemCounter < visibleItems) {
          headerWrapper.insertBefore(item, doc.querySelector('.header-items > .header-item'));
        }
        headerItemCounter += 1;
      });
      if (headerAllItems <= visibleItems) {
        headerWrapper.removeChild(headerMore);
      }
    }

  }

  doc.addEventListener('DOMContentLoaded', () => {
    const loginForm = doc.getElementById('form-login');
    const logoutBtn = doc.querySelector('.header-items a[href*="task=logout"]');
    const wrapper = doc.querySelector('.wrapper');
    const menu = doc.querySelector('.sidebar-menu');
    const sidebarWrapper = doc.querySelector('.sidebar-wrapper');
    const sidebarNav = doc.querySelector('.sidebar-nav');
    const subHeadToolbar = doc.querySelector('.subhead');
    const mobile = window.matchMedia('(max-width: 992px)');
    const mobileTablet = window.matchMedia('(min-width: 576px) and (max-width:991.98px)');
    const mobileSmallLandscape = window.matchMedia('(max-width: 767.98px)');
    const mobileSmall = window.matchMedia('(max-width: 575.98px)');
    const desktop = window.matchMedia('(max-width: 1160px)');
    const desktopSmall = window.matchMedia('(max-width: 1023px)');

    changeSVGLogoColor();

    // Fade out login form when login was successful
    if (loginForm) {
      loginForm.addEventListener('joomla:login', () => {
        fade('out', 'narrow');
      });
    }

    // Fade in dashboard when coming from login or going back to login
    fade('in');

    // Fade out dashboard on logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        fade('out', 'wider');
      });
    }

    // Make logo big or small like the sidebar-wrapper
    if (!sidebarWrapper || mobile.matches) {
      changeLogo('closed');
    } else {
      changeLogo();
    }

    window.addEventListener('joomla:menu-toggle', (event) => {
      if (!mobile.matches) {
        changeLogo(event.detail);
      }
    });

    if (mobileSmall.matches) {
      toggleArrowIcon();
      if (menu) {
        wrapper.classList.remove('closed');
      }
    }

    if (mobileTablet.matches && menu) {
      wrapper.classList.add('closed');
    }

    if (mobileSmallLandscape.matches) {
      if (sidebarNav) sidebarNav.classList.add('collapse');
      if (subHeadToolbar) subHeadToolbar.classList.add('collapse');
    }

    if (mobileSmallLandscape.matches || desktopSmall.matches) {
      headerItemsInDropdown(2);
    } else if (mobile.matches || desktop.matches) {
      headerItemsInDropdown(4);
    } else {
      headerItemsInDropdown(6);
    }

    window.addEventListener('resize', () => {
      /* eslint no-unused-expressions: ["error", { "allowTernary": true }] */
      (mobile.matches) ? changeLogo('closed') : changeLogo();
      (mobileSmall.matches) ? toggleArrowIcon() : toggleArrowIcon('top');
      if (sidebarNav) (mobileSmallLandscape.matches) ? sidebarNav.classList.add('collapse') : sidebarNav.classList.remove('collapse');
      if (subHeadToolbar) (mobileSmallLandscape.matches) ? subHeadToolbar.classList.add('collapse') : subHeadToolbar.classList.remove('collapse');

      if (menu) {
        if (mobileSmall.matches) {
          wrapper.classList.remove('closed');
        }
        if (mobileTablet.matches) {
          wrapper.classList.add('closed');
        }
      }

      if (mobileSmallLandscape.matches || desktopSmall.matches) {
        headerItemsInDropdown(2);
      } else if (mobile.matches || desktop.matches) {
        headerItemsInDropdown(4);
      } else {
        headerItemsInDropdown(6);
      }
    });
  });
})(window.Joomla, document);
