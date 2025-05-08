
import React from 'react';

const NoResultsMessage: React.FC = () => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 dark:text-gray-400">No results found. Try a different search term.</p>
    </div>
  );
};

export default NoResultsMessage;
