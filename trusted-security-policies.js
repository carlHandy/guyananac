import DOMPurify from 'dompurify';

if (window.trustedTypes && trustedTypes.createPolicy) { // Feature testing
    trustedTypes.createPolicy('default', {
      createHTML: (string, sink) => DOMPurify.sanitize(string, {RETURN_TRUSTED_TYPE: true})
    });
  }