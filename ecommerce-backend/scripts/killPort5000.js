import { execSync } from "child_process";

try {
  console.log("Checking for processes using port 5000...");
  
  const output = execSync('netstat -ano | findstr :5000 | findstr LISTENING', { 
    encoding: 'utf8',
    stdio: 'pipe'
  }).trim();
  
  if (output) {
    const lines = output.split('\n');
    const pids = lines
      .map(line => line.trim().split(/\s+/).pop())
      .filter(Boolean)
      .filter((pid, index, arr) => arr.indexOf(pid) === index); // Remove duplicates
    
    if (pids.length > 0) {
      console.log(`Found ${pids.length} process(es) using port 5000. Killing them...`);
      pids.forEach(pid => {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`✅ Killed process ${pid}`);
        } catch (e) {
          console.log(`⚠️  Could not kill process ${pid} (may already be terminated)`);
        }
      });
      console.log("\n✅ Port 5000 is now free!");
    } else {
      console.log("✅ Port 5000 is already free.");
    }
  } else {
    console.log("✅ Port 5000 is already free.");
  }
} catch (e) {
  if (e.status === 1) {
    // netstat returns 1 when no matches found
    console.log("✅ Port 5000 is already free.");
  } else {
    console.error("❌ Error:", e.message);
  }
}

