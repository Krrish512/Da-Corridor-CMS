import React from 'react';
import { serviceIcons, DEFAULT_ICON } from '../../utils/serviceIcons';

/**
 * DynamicIcon renders a Lucide icon based on the string name from the serviceIcons registry.
 * Provides case-insensitive fallback matching and defaults to HelpCircle if unrecognized.
 */
export const DynamicIcon = ({ name, className = '', size = 24, style, ...props }) => {
  const iconKey = typeof name === 'string' ? name.trim() : '';

  let IconComponent = serviceIcons[iconKey];

  if (!IconComponent && iconKey) {
    // Case-insensitive lookup fallback
    const keyMatch = Object.keys(serviceIcons).find(
      (k) => k.toLowerCase() === iconKey.toLowerCase()
    );
    if (keyMatch) {
      IconComponent = serviceIcons[keyMatch];
    }
  }

  if (!IconComponent) {
    IconComponent = DEFAULT_ICON;
  }

  return <IconComponent className={className} size={size} style={style} {...props} />;
};

export default DynamicIcon;
