import { Search } from 'lucide-react';

interface InboxSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const InboxSearch = ({ value, onChange }: InboxSearchProps) => {
  return (
    <div className="inbox__search">
      <Search className="inbox__search-icon" aria-hidden="true" />
      <input
        className="inbox__search-input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search chats"
        aria-label="Search chats"
      />
    </div>
  );
};

export default InboxSearch;
