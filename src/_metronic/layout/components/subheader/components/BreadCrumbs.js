/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import {Link} from "react-router-dom";

export function BreadCrumbs({items}) {
  const parser = new DOMParser();
  if (!items || !items.length) {
      return "";
  }
  return (
    <ul className="breadcrumb breadcrumb-transparent breadcrumb-dot font-weight-bold p-0 my-2">
      <li className="breadcrumb-item">
        <Link to="/dashboard/manager">
          <i className="flaticon2-shelter text-muted icon-1x" />
        </Link>
      </li>
      {items.map((item, index) => (
        <li key={`bc${index}`} className="breadcrumb-item">
          <Link className="text-muted" to={{ pathname: item.pathname, search: item.search }}>
            {/* {item.title} */}
            {parser.parseFromString(`${item.title}`, 'text/html').body.textContent}
          </Link>
        </li>
      ))}
    </ul>
  );
}
