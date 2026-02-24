import { Select, type SelectOption } from '@/components/ui/select';
import type { MediaDevice } from '@/hooks/useMediaDevices';

interface DeviceSelectorProps {
  devices: MediaDevice[];
  value: string;
  onChange: (deviceId: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export function DeviceSelector({
  devices,
  value,
  onChange,
  placeholder,
  disabled,
}: DeviceSelectorProps) {
  const options: SelectOption[] = devices.map((d) => ({
    value: d.deviceId,
    label: d.label,
  }));

  return (
    <Select
      options={options}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full"
    />
  );
}
