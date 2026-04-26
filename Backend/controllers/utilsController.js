import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export const openFolderPicker = async (req, res) => {
  try {
    // PowerShell script to open folder browser dialog
    const psScript = `
      Add-Type -AssemblyName System.Windows.Forms;
      $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog;
      $folderBrowser.Description = 'Select Torrent Download Folder';
      $folderBrowser.ShowNewFolderButton = $true;
      $result = $folderBrowser.ShowDialog((New-Object System.Windows.Forms.Form -Property @{TopMost = $true }));
      if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        Write-Output $folderBrowser.SelectedPath;
      }
    `;

    const { stdout, stderr } = await execPromise(`powershell -NoProfile -Command "${psScript.replace(/\n/g, ' ')}"`);

    if (stderr && !stderr.includes('HandlerCheck')) {
      console.error('PowerShell Error:', stderr);
      return res.status(500).json({ error: 'Failed to open folder picker' });
    }

    const selectedPath = stdout.trim();
    if (selectedPath) {
      res.json({ path: selectedPath });
    } else {
      res.status(400).json({ error: 'No folder selected' });
    }
  } catch (error) {
    console.error('Error opening folder picker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
