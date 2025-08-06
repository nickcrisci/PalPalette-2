import React from "react";
import DeviceManagement from "../DeviceManagement";

const LightingSystems: React.FC = () => {
  return (
    <DeviceManagement
      defaultView="lighting"
      showViewSelector={false}
      title="Lighting Systems"
    />
  );
};

export default LightingSystems;
