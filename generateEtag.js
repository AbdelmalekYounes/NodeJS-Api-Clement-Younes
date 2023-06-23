import crypto from 'crypto';



function generateEtag(data){
    const hash=crypto.createHash('sha256').update(data).digest('hex');
    return hash;
}
export default generateEtag;