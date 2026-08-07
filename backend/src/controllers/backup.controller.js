const path = require('path');
const fs = require('fs');
const { createBackup, listBackups, deleteBackupFile, backupDir } = require('../utils/backup');

const getBackups = async (req, res) => {
  try {
    const backups = await listBackups();
    res.json(backups);
  } catch (error) {
    console.error('[GET BACKUPS ERROR]:', error);
    res.status(500).json({ message: 'Failed to retrieve backups list' });
  }
};

const triggerBackup = async (req, res) => {
  const { type = 'FULL' } = req.body;
  try {
    const result = await createBackup(req, type);
    res.status(201).json(result);
  } catch (error) {
    console.error('[TRIGGER BACKUP ERROR]:', error);
    res.status(500).json({ message: error.message || 'Failed to generate backup archive' });
  }
};

const downloadBackup = async (req, res) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const filePath = path.join(backupDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Backup archive file not found' });
  }

  res.download(filePath, safeFilename);
};

const deleteBackup = async (req, res) => {
  const { filename } = req.params;
  try {
    const result = await deleteBackupFile(req, filename);
    res.json(result);
  } catch (error) {
    console.error('[DELETE BACKUP ERROR]:', error);
    res.status(500).json({ message: error.message || 'Failed to delete backup file' });
  }
};

module.exports = {
  getBackups,
  triggerBackup,
  downloadBackup,
  deleteBackup,
};
