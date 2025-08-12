# 🌐 External Access Guide for CIMS

## For Users Accessing via ngrok Link

If someone shared a CIMS ngrok link with you, follow these steps:

### 1. **First Visit (ngrok Warning Page)**
- Click the ngrok URL
- You'll see a warning page: **"You are about to visit..."**
- Click **"Visit Site"** button
- This is normal and safe for development/testing

### 2. **If You Get 304 Not Modified Error**

#### Option A: Use Incognito/Private Mode (Recommended)
- Open the link in an incognito/private browser window
- This bypasses all caching issues

#### Option B: Clear Browser Cache
- **Chrome/Firefox**: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- **Safari**: `Cmd + Option + R`
- Or go to browser settings and clear cache

#### Option C: Add URL Parameters
Add `?t=` + current timestamp to the URL:
```
https://abc123.ngrok-free.app/login?t=1628870400
```

### 3. **Login Process**
- Use the same credentials as the local system
- Username and password are the same
- If login fails, try the cache clearing steps above

### 4. **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| White/blank page | Clear cache and hard refresh |
| "Login failed" message | Try incognito mode |
| Page won't load | Check if ngrok URL is still active |
| 304 Not Modified | Clear browser cache |
| CORS errors | Contact the person who shared the link |

### 5. **Technical Notes**
- The ngrok tunnel routes to a development server
- All data is temporary and for testing only
- The link may expire when the developer stops sharing
- Internet connection required (obvious, but worth noting)

### 6. **Browser Compatibility**
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ IE11 (may have issues)

### 7. **Security Notes**
- This is a development/testing environment
- Don't enter real sensitive data
- The connection is encrypted (https://)
- Data is not persistent

## For Developers Sharing the Link

To minimize external user issues:

1. **Use the external access script**:
   ```bash
   ./start-external.sh
   ```

2. **Share the frontend URL** (not backend URL)

3. **Inform users about**:
   - The ngrok warning page (it's normal)
   - Using incognito mode if issues occur
   - Clearing cache if login doesn't work

4. **Monitor usage**:
   - Check http://localhost:4040 for traffic
   - Restart if users report issues

## 🆘 **Still Having Issues?**

Contact the person who shared the link and mention:
- Your browser type and version
- The exact error message
- Whether you tried incognito mode
- Screenshot if possible

---

*This guide is for development/testing purposes only.*
