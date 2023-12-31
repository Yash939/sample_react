import React from 'react';
import { connect } from 'formik';

class ErrorFocus extends React.Component {
  componentDidUpdate(prevProps) {
    const { isSubmitting, isValidating, errors } = prevProps.formik;
    const keys = Object.keys(errors);
    if (keys.length > 0 && isSubmitting && !isValidating) {
        const selector = `[name="${keys[0]}"]`;
      const errorElement = document.querySelector(selector);
      if (errorElement) {
        errorElement.setAttribute("tabindex",-1)
        errorElement.focus();
      }
    }
  }

  render() {
    return null;
  }
}

export default connect(ErrorFocus);