/* ==========================================================================
   A Step Above Day Care Academy — Demo Redesign
   site.js  (plain JS, no dependencies)
   --------------------------------------------------------------------------
   Modules:
     1. Mobile menu toggle
     2. Active nav detection (by filename)
     3. Footer year
     4. Scroll reveal (IntersectionObserver)
     5. Accordion (ARIA disclosure)
     6. Tabs (ARIA tablist)
     7. Demo form validation + loading/success states + aria-live
     8. Escape key handling for overlays
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initActiveNav();
    initFooterYear();
    initScrollReveal();
    initAccordions();
    initTabs();
    initForms();
  });

  /* -----------------------------------------------------------------------
     1. MOBILE MENU
     -------------------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    function open() {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      expanded ? close() : open();
    });

    // Close when a nav link is chosen (mobile)
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && window.matchMedia("(max-width: 860px)").matches) {
        close();
      }
    });

    // Close on Escape; reset state when resizing back to desktop
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    window.addEventListener("resize", function () {
      if (!window.matchMedia("(max-width: 860px)").matches) close();
    });
  }

  /* -----------------------------------------------------------------------
     2. ACTIVE NAV DETECTION
     Marks the current page link with aria-current="page".
     -------------------------------------------------------------------- */
  function initActiveNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    if (path === "") path = "index.html";
    var links = document.querySelectorAll(".nav-list a[href]");
    links.forEach(function (link) {
      var href = link.getAttribute("href").split("/").pop();
      if (href === path) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* -----------------------------------------------------------------------
     3. FOOTER YEAR
     -------------------------------------------------------------------- */
  function initFooterYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* -----------------------------------------------------------------------
     4. SCROLL REVEAL
     -------------------------------------------------------------------- */
  function initScrollReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* -----------------------------------------------------------------------
     5. ACCORDION (ARIA disclosure pattern)
     Markup:
       .accordion > .accordion__item >
         button.accordion__trigger[aria-expanded][aria-controls]
         div.accordion__panel[id][hidden]
     -------------------------------------------------------------------- */
  function initAccordions() {
    var triggers = document.querySelectorAll(".accordion__trigger");
    triggers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        btn.setAttribute("aria-expanded", String(!expanded));
        if (panel) panel.hidden = expanded;
      });
    });
  }

  /* -----------------------------------------------------------------------
     6. TABS (ARIA tablist pattern with arrow-key support)
     Markup:
       .tabs >
         [role=tablist] > button[role=tab][aria-selected][aria-controls][id]
         [role=tabpanel][aria-labelledby][hidden]
     -------------------------------------------------------------------- */
  function initTabs() {
    var groups = document.querySelectorAll(".tabs");
    groups.forEach(function (group) {
      var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
      if (!tabs.length) return;

      function activate(tab) {
        tabs.forEach(function (t) {
          var selected = t === tab;
          t.setAttribute("aria-selected", String(selected));
          t.tabIndex = selected ? 0 : -1;
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !selected;
        });
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () { activate(tab); });
        tab.addEventListener("keydown", function (e) {
          var idx = i;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") idx = (i + 1) % tabs.length;
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") idx = (i - 1 + tabs.length) % tabs.length;
          else if (e.key === "Home") idx = 0;
          else if (e.key === "End") idx = tabs.length - 1;
          else return;
          e.preventDefault();
          tabs[idx].focus();
          activate(tabs[idx]);
        });
      });
    });
  }

  /* -----------------------------------------------------------------------
     7. DEMO FORMS — validation, loading, success, aria-live
     Any <form data-demo-form> is intercepted (never submitted to a server).
     -------------------------------------------------------------------- */
  function initForms() {
    var forms = document.querySelectorAll("form[data-demo-form]");
    forms.forEach(function (form) {
      form.setAttribute("novalidate", "novalidate");

      // Clear an individual field error as the user fixes it
      form.addEventListener("input", function (e) {
        var field = e.target.closest(".field, .check-field");
        if (field && e.target.getAttribute("aria-invalid") === "true") {
          clearError(e.target);
        }
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = form.querySelector(".form-status");
        var firstInvalid = null;
        var valid = true;

        // Validate all required controls
        var controls = form.querySelectorAll("[required]");
        controls.forEach(function (ctrl) {
          if (!validateControl(ctrl)) {
            valid = false;
            if (!firstInvalid) firstInvalid = ctrl;
          } else {
            clearError(ctrl);
          }
        });

        if (!valid) {
          showStatus(status, "error",
            "Please review the highlighted fields and try again.");
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        // Simulate a brief loading state, then show success (no backend).
        var submitBtn = form.querySelector('button[type="submit"], .btn[type="submit"]');
        var originalHTML = submitBtn ? submitBtn.innerHTML : "";
        if (submitBtn) {
          submitBtn.setAttribute("aria-busy", "true");
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sending…';
        }
        showStatus(status, "", "Sending your demo inquiry…");

        setTimeout(function () {
          if (submitBtn) {
            submitBtn.removeAttribute("aria-busy");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
          }
          var msg = form.getAttribute("data-success") ||
            "Thank you. This demo form shows how a family inquiry would be received in a real implementation. No information was actually sent.";
          showStatus(status, "success", msg);
          form.reset();
          // Move focus to the confirmation for screen reader users
          if (status) { status.setAttribute("tabindex", "-1"); status.focus(); }
        }, 1100);
      });
    });
  }

  function validateControl(ctrl) {
    var type = (ctrl.getAttribute("type") || ctrl.tagName).toLowerCase();
    var value = (ctrl.value || "").trim();

    if (type === "checkbox") {
      return ctrl.checked;
    }
    if (!value) {
      setError(ctrl, "This field is required.");
      return false;
    }
    if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(ctrl, "Please enter a valid email address.");
      return false;
    }
    if (type === "tel" && !/[\d][\d\s().+-]{6,}/.test(value)) {
      setError(ctrl, "Please enter a valid phone number.");
      return false;
    }
    return true;
  }

  function setError(ctrl, message) {
    ctrl.setAttribute("aria-invalid", "true");
    var wrap = ctrl.closest(".field, .check-field");
    if (!wrap) return;
    var err = wrap.querySelector(".error");
    if (!err) {
      err = document.createElement("p");
      err.className = "error";
      wrap.appendChild(err);
    }
    if (!err.id) err.id = (ctrl.id || "f") + "-error";
    var describedby = ctrl.getAttribute("aria-describedby") || "";
    if (describedby.indexOf(err.id) === -1) {
      ctrl.setAttribute("aria-describedby", (describedby + " " + err.id).trim());
    }
    err.textContent = message;
  }

  function clearError(ctrl) {
    ctrl.removeAttribute("aria-invalid");
    var wrap = ctrl.closest(".field, .check-field");
    if (!wrap) return;
    var err = wrap.querySelector(".error");
    if (err) err.textContent = "";
  }

  function showStatus(el, kind, message) {
    if (!el) return;
    el.hidden = false;
    el.classList.remove("is-success", "is-error");
    if (kind) el.classList.add("is-" + kind);
    el.textContent = message;
  }
})();
