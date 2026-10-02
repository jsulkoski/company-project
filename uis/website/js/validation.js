/**
 * Nexova Solutions – Application Form Validation
 *
 * Validates all form fields with real-time feedback,
 * displays specific error messages, and prevents submission
 * when validation fails.
 *
 * Fields validated:
 *   first-name, last-name, email, phone, current-position,
 *   years-experience, industry, position-type (radio),
 *   english-level, cv-upload (file), referral-source,
 *   comments (optional), terms (checkbox)
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

    'first-name': function (value) {
      if (!value || value.trim().length === 0) return 'First name is required.';
      if (value.trim().length < 2) return 'First name must be at least 2 characters.';
      if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(value.trim())) {
        return 'First name can only contain letters, spaces, hyphens, and apostrophes.';
      }
      return '';
    },

    'last-name': function (value) {
      if (!value || value.trim().length === 0) return 'Last name is required.';
      if (value.trim().length < 2) return 'Last name must be at least 2 characters.';
      if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(value.trim())) {
        return 'Last name can only contain letters, spaces, hyphens, and apostrophes.';
      }
      return '';
    },

    'email': function (value) {
      if (!value || value.trim().length === 0) return 'Email address is required.';
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return 'Please enter a valid email address (e.g., name@domain.com).';
      }
      if (value.trim().length > 254) return 'Email address is too long.';
      return '';
    },

    'phone': function (value) {
      if (!value || value.trim().length === 0) return 'Phone number is required.';
      // Allow international formats: +34 612 345 678, 0034 612345678, etc.
      var cleaned = value.replace(/[\s\-\(\)\.]/g, '');
      if (!/^\+?\d{6,15}$/.test(cleaned)) {
        return 'Please enter a valid phone number with country code (e.g., +34 612 345 678).';
      }
      return '';
    },

    'current-position': function (value) {
      if (!value || value.trim().length === 0) return 'Current or most recent position is required.';
      if (value.trim().length < 2) return 'Position must be at least 2 characters.';
      return '';
    },

    'years-experience': function (value) {
      if (value === '' || value === null || value === undefined) return 'Years of experience is required.';
      var num = Number(value);
      if (isNaN(num) || !Number.isInteger(num)) return 'Please enter a whole number.';
      if (num < 0) return 'Experience cannot be negative.';
      if (num > 60) return 'Please enter a valid number between 0 and 60.';
      return '';
    },

    'industry': function (value) {
      if (!value || value === '') return 'Please select your industry expertise.';
      return '';
    },

    'position-type': function () {
      var radios = form.querySelectorAll('input[name="position-type"]');
      for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) return '';
      }
      return 'Please select a position type.';
    },

    'english-level': function (value) {
      if (!value || value === '') return 'Please select your English proficiency level.';
      return '';
    },

    'cv-upload': function () {
      var input = document.getElementById('cv-upload');
      if (!input || !input.files || input.files.length === 0) {
        return 'Please upload your CV.';
      }
      var file = input.files[0];
      var maxSize = 5 * 1024 * 1024; // 5 MB
      var name = file.name || '';
      var extension = name.split('.').pop().toLowerCase();
      var allowed = ['pdf', 'doc', 'docx', 'txt'];
      if (allowed.indexOf(extension) === -1) {
        return 'Accepted formats: PDF, DOC, DOCX, or TXT.';
      }
      if (file.size > maxSize) {
        return 'File size must be under 5 MB.';
      }
      return '';
    },

    'referral-source': function (value) {
      if (!value || value === '') return 'Please tell us how you heard about us.';
      return '';
    },

    'comments': function (value) {
      // Optional field – only validate length if provided
      if (value && value.length > 1000) return 'Comments must be under 1000 characters.';
      return '';
    },

    'terms': function () {
      var checkbox = document.getElementById('terms');
      return (checkbox && checkbox.checked) ? '' : 'You must agree to the Privacy Policy and Terms of Service.';
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
    } else if (input.type === 'file') {
      error = validators['cv-upload']();
    } else if (input.name === 'position-type') {
      error = validators['position-type']();
    } else {
      error = validators[inputId](input.value);
    }

    if (error) {
      showError(inputId, error);
      return false;
    } else {
      clearError(inputId);
      // Mark as valid if the field has a value
      if (input.type === 'file') {
        if (input.files && input.files.length > 0) markValid(inputId);
      } else if (input.type === 'checkbox') {
        if (input.checked) markValid(inputId);
      } else if (input.name === 'position-type') {
        markValid(inputId);
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
      'first-name', 'last-name', 'email', 'phone',
      'current-position', 'years-experience', 'industry',
      'position-type', 'english-level', 'cv-upload',
      'referral-source', 'terms'
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
    'first-name', 'last-name', 'email', 'phone',
    'current-position', 'years-experience', 'industry',
    'english-level', 'referral-source'
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

  /* ── File input change handler ─────────────────────────────────── */

  var cvUpload = document.getElementById('cv-upload');
  if (cvUpload) {
    cvUpload.addEventListener('change', function () {
      validateField('cv-upload');
    });
  }

  /* ── Radio button change handler ───────────────────────────────── */

  var positionRadios = form.querySelectorAll('input[name="position-type"]');
  for (var r = 0; r < positionRadios.length; r++) {
    positionRadios[r].addEventListener('change', function () {
      validateField('position-type');
    });
  }

  /* ── Terms checkbox change handler ─────────────────────────────── */

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
        // Focus the first name field
        var firstName = document.getElementById('first-name');
        if (firstName) firstName.focus();
      }, 50);
    });
  }

})();