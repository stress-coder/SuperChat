interface TypingIndicatorProps {
  /** Named so a screen reader hears who is typing, not just that someone is. */
  name: string;
}

const TypingIndicator = ({ name }: TypingIndicatorProps) => {
  return (
    <div className="typing" role="status" aria-label={`${name} is typing`}>
      <span className="typing__dot" aria-hidden="true" />
      <span className="typing__dot" aria-hidden="true" />
      <span className="typing__dot" aria-hidden="true" />
    </div>
  );
};

export default TypingIndicator;
