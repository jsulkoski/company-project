/**
 * Nexova Solutions – Application Form Validation
 *
 * Validates all form fields with real-time feedback,
 * displays specific error messages, and prevents submission
 * when validation fails.
 *
 * Fields validated:
 *   full-name, email, phone, country, years-experience, industry,
 *   english-level, availability, linkedin, comments, terms
 */

(function () {
  'use strict';

  /* ── DOM references ─────────────────────────────────────────────── */

  var form = document.getElementById('application-form');
  if (!form) return;

  var successMessage = document.getElementById('success-message');

  /* ── Helper functions ──────────────────────────────────────────── */

  /**
   * Display an error message on a specific field.
   * @param {string} inputId - The id of the input element.
   * @param {string} message - The error message to display.
   */
  function showError(inputId, message) {
    var input = document.getElementById(inputId);
    var errorEl = document.getElementById(inputId + '-error');
    if (!input || !errorEl) return;

    // Remove success styling
    input.classList.remove('border-green-500', 'ring-2', 'ring-green-300');
    // Add error styling
    input.classList.add('border-red-500');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    errorEl.setAttribute('role', 'alert');
  }

  /**
   * Clear the error on a specific field.
   * @param {string} inputId - The id of the input element.
   */
  function clearError(inputId) {
    var input = document.getElementById(inputId);
    var errorEl = document.getElementById(inputId + '-error');
    if (!input || !errorEl) return;

    input.classList.remove('border-red-500', 'border-green-500', 'ring-2', 'ring-green-300', 'ring-red-300');
    errorEl.classList.add('hidden');
    errorEl.textContent = '';
  }

  /**
   * Mark a field as valid with green border.
   * @param {string} inputId - The id of the input element.
   */
  function markValid(inputId) {
    var input = document.getElementById(inputId);
    if (!input) return;
    input.classList.remove('border-red-500', 'ring-red-300');
    input.classList.add('border-green-500');
  }

  /* ── Validation rules ──────────────────────────────────────────── */

  var validators = {

    'full-name': function (value) {
      if (!value || value.trim().split(/\s+/).length < 2) return 'Name must contain at least first and last name';
      return '';
    },

    'email': function (value) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value || !emailRegex.test(value.trim())) return 'Enter a valid email (example: <name@company.com>)';
      if (value.trim().length > 254) return 'Email address is too long.';
      return '';
    },

    'phone': function (value) {
      if (!value || !/^\+\d{1,3}\s\d[\d\s-]{5,14}$/.test(value.trim())) return 'Phone must include country code (example: +34 612 345 678)';
      return '';
    },

    'country': function (value) {
      if (!value) return 'Select your country of residence';
      return '';
    },

    'years-experience': function (value) {
      if (value === '' || value === null || value === undefined) return 'Years of experience must be between 0 and 50';
      var num = Number(value);
      if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 50) return 'Years of experience must be between 0 and 50';
      return '';
    },

    'availability': function () {
      var options = form.querySelectorAll('input[name="availability"]');
      for (var i = 0; i < options.length; i++) {
        if (options[i].checked) return '';
      }
      return 'Select your availability';
    },

    'linkedin': function (value) {
      if (!value || value.trim().length === 0) return '';
      try {
        var profileUrl = new URL(value.trim());
        if (profileUrl.protocol !== 'https:' && profileUrl.protocol !== 'http:') {
          return 'If you include LinkedIn, it must be a valid URL';
        }
      } catch (error) {
        return 'If you include LinkedIn, it must be a valid URL';
      }
      return '';
    },

    'industry': function (value) {
      if (!value) return 'Select your sector of interest';
      return '';
    },

    'english-level': function (value) {
      if (!value) return 'Indicate your English level';
      return '';
    },

    'comments': function (value) {
      // Optional field – only validate length if provided
      if (value && value.length > 500) return 'Comments cannot exceed 500 characters (' + (500 - value.length) + ' remaining)';
      return '';
    },

    'terms': function () {
      var checkbox = document.getElementById('terms');
      return (checkbox && checkbox.checked) ? '' : 'You must accept the data processing policy to continue';
    }

  };

  /* ── Validate a single field ───────────────────────────────────── */

  /**
   * Validate one field by its input id.
   * @param {string} inputId - The field id to validate.
   * @returns {boolean} True if valid.
   */
  function validateField(inputId) {
    var input = document.getElementById(inputId);
    if (!input) return true;

    var error = '';

    if (input.type === 'checkbox') {
      error = validators['terms']();
    } else if (inputId === 'availability') {
      error = validators.availability();
    } else {
      error = validators[inputId](input.value);
    }

    if (error) {
      showError(inputId, error);
      return false;
    } else {
      clearError(inputId);
      // Mark as valid if the field has a value
      if (input.type === 'checkbox') {
        if (input.checked) markValid(inputId);
      } else if (inputId === 'availability') {
        var choices = form.querySelectorAll('input[name="availability"]');
        for (var i = 0; i < choices.length; i++) {
          if (choices[i].checked) markValid(inputId);
        }
      } else if (input.value && input.value.toString().trim().length > 0) {
        markValid(inputId);
      }
      return true;
    }
  }

  /* ── Validate all form fields ──────────────────────────────────── */

  /**
   * Loop through all required fields and validate each.
   * @returns {boolean} True only if every field is valid.
   */
  function validateAll() {
    var fields = [
      'full-name', 'email', 'phone', 'country', 'years-experience',
      'industry', 'english-level', 'availability', 'linkedin', 'comments', 'terms'
    ];

    var allValid = true;
    for (var i = 0; i < fields.length; i++) {
      if (!validateField(fields[i])) {
        allValid = false;
      }
    }
    return allValid;
  }

  /* ── Real-time validation on blur & input ──────────────────────── */

  var blurFields = [
    'full-name', 'email', 'phone', 'country', 'years-experience',
    'linkedin', 'industry', 'english-level', 'comments'
  ];

  for (var b = 0; b < blurFields.length; b++) {
    (function (fieldId) {
      var input = document.getElementById(fieldId);
      if (!input) return;

      // Validate when the user leaves the field
      input.addEventListener('blur', function () {
        validateField(fieldId);
      });

      // Real-time validation as the user types (if there was a previous error)
      input.addEventListener('input', function () {
        var errorEl = document.getElementById(fieldId + '-error');
        if (errorEl && !errorEl.classList.contains('hidden')) {
          // There is a current error — re-validate to clear it if fixed
          validateField(fieldId);
        } else {
          // No current error — just toggle success styling
          var v = validators[fieldId];
          if (v) {
            var err = v(input.value);
            if (!err) {
              markValid(fieldId);
            } else {
              input.classList.remove('border-green-500');
            }
          }
        }
      });
    })(blurFields[b]);
  }

  var comments = document.getElementById('comments');
  var commentsCounter = document.getElementById('comments-counter');
  function updateCommentsCounter() {
    if (!comments || !commentsCounter) return;
    var remaining = 500 - comments.value.length;
    commentsCounter.textContent = remaining + ' character' + (remaining === 1 ? '' : 's') + ' remaining.';
  }
  if (comments) {
    comments.addEventListener('input', updateCommentsCounter);
    updateCommentsCounter();
  }

  /* ── Availability and data policy change handlers ──────────────── */

  var availabilityOptions = form.querySelectorAll('input[name="availability"]');
  for (var a = 0; a < availabilityOptions.length; a++) {
    availabilityOptions[a].addEventListener('change', function () {
      validateField('availability');
    });
  }

  var termsCheckbox = document.getElementById('terms');
  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', function () {
      validateField('terms');
    });
  }

  /* ── Accessibility: live region for error summary ──────────────── */

  var summaryRegion = document.createElement('div');
  summaryRegion.id = 'form-summary-errors';
  summaryRegion.className = 'sr-only';
  summaryRegion.setAttribute('aria-live', 'assertive');
  summaryRegion.setAttribute('aria-atomic', 'true');
  summaryRegion.textContent = '';
  form.insertBefore(summaryRegion, form.firstChild);

  /* ── Form submission handler ───────────────────────────────────── */

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var isValid = validateAll();

    if (!isValid) {
      // Scroll to and focus the first field with an error
      var firstError = form.querySelector('.border-red-500');
      if (firstError) {
        firstError.focus();
      }

      // Announce error count via the live region
      var errorCount = 0;
      var allErrorEls = form.querySelectorAll('[id$="-error"]');
      for (var e = 0; e < allErrorEls.length; e++) {
        if (!allErrorEls[e].classList.contains('hidden')) {
          errorCount++;
        }
      }
      summaryRegion.textContent = errorCount + ' field' + (errorCount !== 1 ? 's' : '') + ' need your attention. Please correct the errors above.';
      return;
    }

    // All valid — show success message
    form.classList.add('hidden');
    successMessage.classList.remove('hidden');
    successMessage.focus();
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ── Clear / Reset handler ─────────────────────────────────────── */

  var clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      // Use setTimeout to let the native form reset complete first
      setTimeout(function () {
        // Clear all error messages
        var allErrorEls = form.querySelectorAll('[id$="-error"]');
        for (var i = 0; i < allErrorEls.length; i++) {
          allErrorEls[i].classList.add('hidden');
          allErrorEls[i].textContent = '';
        }
        // Remove all validation styling
        var allInputs = form.querySelectorAll('input, select, textarea');
        for (var j = 0; j < allInputs.length; j++) {
          allInputs[j].classList.remove('border-red-500', 'border-green-500', 'ring-2', 'ring-green-300', 'ring-red-300');
        }
        // Hide success message if visible and show the form
        successMessage.classList.add('hidden');
        form.classList.remove('hidden');
        updateCommentsCounter();
        // Focus the first name field
        var fullName = document.getElementById('full-name');
        if (fullName) fullName.focus();
      }, 50);
    });
  }

})();