// components/ListItem.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ListItemProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
}

const ListItem: React.FC<ListItemProps> = ({ title, subtitle, rightContent }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightContent && <View style={styles.right}>{rightContent}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  right: {
    marginLeft: 16,
  },
});

export default ListItem;