-- Creates dentist availability schedule slots
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dentist_id INT NOT NULL,
  day VARCHAR(20) NOT NULL,
  time VARCHAR(10) NOT NULL,
  status ENUM('available','booked','blocked') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_dentist_day_time (dentist_id, day, time),
  CONSTRAINT fk_schedules_dentist
    FOREIGN KEY (dentist_id) REFERENCES users(id)
    ON DELETE CASCADE
);

