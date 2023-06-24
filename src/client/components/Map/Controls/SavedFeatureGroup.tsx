import React, { FC } from 'react';
import { FeatureGroupProps } from '../../../../types';

const SavedFeatureGroup: FC<FeatureGroupProps> = ({
  id,
  stdName,
  displayName,
  loadFeature
}) => {
  return (
    <div className="saved-group">
      <button className="group-title" onClick={loadFeature}>
        {displayName}
      </button>
      <div className="group-details">
        <p>ID: {id}</p>
        <p>Standardized Name: {stdName}</p>
      </div>
    </div>
  );
};

export default SavedFeatureGroup;
