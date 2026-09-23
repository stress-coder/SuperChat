interface DateSeparatorProps {
  label: string;
}

/** The little centered pill that breaks a thread into days. */
const DateSeparator = ({ label }: DateSeparatorProps) => {
  return <span className="date-separator">{label}</span>;
};

export default DateSeparator;
