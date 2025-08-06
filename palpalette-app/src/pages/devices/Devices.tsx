import React from "react";
import DeviceManagement from "../DeviceManagement";

const Devices: React.FC = () => {
  return (
    <DeviceManagement
      defaultView="devices"
      showViewSelector={false}
      title="My Devices"
    />
  );
};

export default Devices;
