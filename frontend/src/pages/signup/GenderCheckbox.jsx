import React from "react";

const GenderCheckbox = () => {
  return (
    <div className="flex">
      <div className="form-control">
        <label className="label p-2">
          <span className="label-text">Male </span>
          <input type="checkbox" className="checkbox border-slate-900 ml-1" />
        </label>
      </div>
      <div className="form-control">
        <label className="label p-2">
          <span className="label-text">Female </span>
          <input type="checkbox" className="checkbox border-slate-900 ml-1" />
        </label>
      </div>
    </div>
  );
};

export default GenderCheckbox;
