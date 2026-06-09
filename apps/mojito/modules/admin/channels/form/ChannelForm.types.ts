import type { Channel } from "../channels.types";

export interface ChannelFormProps {
  initialValues?: Channel;
  onSubmit: (values: Channel) => void;
  isLoading?: boolean;
}
