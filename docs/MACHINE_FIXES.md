# Machine Fixes Captured During Portfolio Planning

Date: 2026-05-23

## Local Laptop Battery Unplug Blank Screen

Status: fixed without reboot.

Root cause evidence indicated display blanking/dimming policy rather than actual suspend or hibernate. The Cinnamon settings daemon was managing power, sleep targets were inactive, `logind` idle action was ignored, and recent journal checks did not show completed suspend/hibernate transitions.

Applied settings:

```bash
gsettings set org.cinnamon.settings-daemon.plugins.power idle-dim-battery false
gsettings set org.cinnamon.settings-daemon.plugins.power sleep-display-battery 0
gsettings set org.cinnamon.settings-daemon.plugins.power sleep-inactive-battery-type 'nothing'
```

Verified state:

```text
idle-dim-battery=false
sleep-display-battery=0
sleep-inactive-battery-timeout=0
sleep-inactive-battery-type='nothing'
DPMS Standby/Suspend/Off: 0/0/0
Monitor is On
screensaver inactive
session Active=yes, IdleHint=no
sleep/suspend/hibernate targets inactive
```

Physical unplug was not reproduced from shell, so this is policy/state verification.

## Rog Strix Joe Reboot Login Screen Investigation

Status: no change applied; evidence did not support an autologon misconfiguration.

Evidence from `rog-strix-joe`:

- Host is Windows 11 Home.
- Reachable as `joepo@100.104.219.106` over Windows OpenSSH.
- WSL reachable on port `2222`.
- Active console session was `ROG_STRIX_JOE\joepo`.
- `explorer.exe` started in session 1 immediately after last reboot.
- `LogonUI.exe` was not running.
- AutoAdminLogon registry requirements were present:
  `AutoAdminLogon=1`, `DefaultUserName=joepo`, `DefaultDomainName=ROG_STRIX_JOE`, `DefaultPassword` exists, `ForceAutoLogon=1`, no `AutoLogonCount`, and no legal notice banner.
- Last reboot log sequence showed restart at `2026-05-21 05:26:15`, event log service start at `05:27:13`, Winlogon session at `05:27:12`, and Explorer at `05:27:34`.
- Lock/saver/power checks did not show a clear lock cause.

Next evidence to capture if it happens again:

```powershell
Get-Process -Name winlogon,LogonUI,explorer -ErrorAction SilentlyContinue
Get-CimInstance Win32_ComputerSystem
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
Get-WinEvent -FilterHashtable @{LogName="Security"; Id=4624,4634,4647,4800,4801; StartTime=(Get-Date).AddHours(-2)}
powercfg /requests
```

Do not reboot just to test. Confirm after the next natural reboot.

