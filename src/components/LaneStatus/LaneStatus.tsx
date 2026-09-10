import Button from '../Button/Button';

type LaneStatusProps = {
  message: string;
  onRetry: () => void;
};

const LaneStatus = ({ message, onRetry }: LaneStatusProps) => (
  <div
    role="alert"
    className="mb-4 flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <p className="text-sm text-fg-secondary">{message}</p>
    <Button type="button" size="sm" variant="outline" onClick={onRetry}>
      Retry
    </Button>
  </div>
);

export default LaneStatus;
