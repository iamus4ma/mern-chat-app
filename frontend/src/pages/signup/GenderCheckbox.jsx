import React from "react";
import { useController } from "react-hook-form";

const GenderCheckbox = ({ control }) => {
  const { field } = useController({
    name: "gender",
    control,
    defaultValue: "",
  });

  return (
    <div className="flex">
      <div className="form-control">
        <label className="label p-2">
          <span className="label-text">Male </span>
          <input
            {...field}
            type="radio"
            value="male"
            className="radio ml-1"
            checked={field.value === "male"}
          />
        </label>
      </div>
      <div className="form-control">
        <label className="label p-2">
          <span className="label-text">Female</span>
          <input
            {...field}
            type="radio"
            value="female"
            className="radio ml-1"
            checked={field.value === "female"}
          />
        </label>
      </div>
    </div>
  );
};

export default GenderCheckbox;
