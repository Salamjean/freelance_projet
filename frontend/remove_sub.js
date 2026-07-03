
const fs = require('fs');

let content = fs.readFileSync('src/dashboard/freelancer/profile/freelancer-profile-edit.tsx', 'utf8');

content = content.replace(/{!profile\.isSubscribed \? \([\s\S]*?\) : \(/g, '(');
content = content.replace(/                    <div className=\erification-actions.*\>[\s\S]*?<\/div>\n                  \)}/g, match => match.slice(0, -1));

fs.writeFileSync('src/dashboard/freelancer/profile/freelancer-profile-edit.tsx', content, 'utf8');

