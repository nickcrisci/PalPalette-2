import React from "react";
import DeviceManagement from "../DeviceManagement";

const DevicesWithLighting: React.FC = () => {
  return (
    <DeviceManagement
      defaultView="both"
      showViewSelector={true}
      title="Devices & Lighting"
    />
  );
};

export default DevicesWithLighting;
