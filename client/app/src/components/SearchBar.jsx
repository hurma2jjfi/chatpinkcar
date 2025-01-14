import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import './styles/SearchBar.css';

function SearchBar({ messages, setFilteredMessages }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filteredMessages = messages.filter((message) => {
      return (
        (message.message && message.message.toLowerCase().includes(query)) ||
        (message.username && message.username.toLowerCase().includes(query))
      );
    });

    setFilteredMessages(filteredMessages);
  };

  const handleSearchIconClick = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (!searchQuery) {
      setIsFocused(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-bar')) {
        setIsFocused(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={`search-bar ${isFocused ? 'focused' : ''}`}>
      <SearchIcon
        className="search-icon"
        onClick={handleSearchIconClick}
      />
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearch}
        onBlur={handleBlur}
        className="search-input"
      />
    </div>
  );
}

export default SearchBar;
