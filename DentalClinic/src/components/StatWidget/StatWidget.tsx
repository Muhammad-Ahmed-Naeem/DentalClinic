import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardBody } from '../Card';
import styles from './StatWidget.module.css';

interface StatWidgetProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconVariant?: 'primary' | 'success' | 'warning' | 'danger';
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  sparkline?: number[];
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  label,
  value,
  icon,
  iconVariant = 'primary',
  trend,
  sparkline,
}) => {
  const maxSpark = sparkline ? Math.max(...sparkline) : 0;

  return (
    <Card hoverable className={styles.widget}>
      <CardBody className={styles.body}>
        <div className={styles.top}>
          <div className={`${styles.iconWrap} ${styles[iconVariant]}`}>
            {icon}
          </div>
          {sparkline && sparkline.length > 0 && (
            <div className={styles.sparkline}>
              {sparkline.map((v, i) => (
                <div
                  key={i}
                  className={styles.sparkBar}
                  style={{ height: `${(v / maxSpark) * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
        {trend && (
          <div className={`${styles.trend} ${trend.direction === 'up' ? styles.trendUp : styles.trendDown}`}>
            {trend.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.value}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
