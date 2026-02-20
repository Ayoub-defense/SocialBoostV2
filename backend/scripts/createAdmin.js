require('dotenv').config({ path: require('path').join(__dirname,'../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME='Admin' } = process.env;
if (!MONGODB_URI||!ADMIN_EMAIL||!ADMIN_PASSWORD) {
  console.error('❌ Variables requises: MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD');
  process.exit(1);
}

(async()=>{
  await mongoose.connect(MONGODB_URI);
  const existing = await User.findOne({ email:ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    await User.findByIdAndUpdate(existing._id,{ isAdmin:true,'subscription.plan':'agency','subscription.status':'active','subscription.grantedByAdmin':true });
    console.log(`✅ Compte ${ADMIN_EMAIL} promu ADMIN + plan Agency`);
  } else {
    await User.create({ name:ADMIN_NAME, email:ADMIN_EMAIL, password:ADMIN_PASSWORD, isAdmin:true, subscription:{ plan:'agency', status:'active', grantedByAdmin:true }});
    console.log(`✅ Admin créé: ${ADMIN_EMAIL}`);
  }
  process.exit(0);
})().catch(e=>{ console.error('❌',e.message); process.exit(1); });
