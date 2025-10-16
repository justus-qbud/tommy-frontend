export function setLocalStorage(name, value, days = 1) {
   const item = {
      value: value,
      expiry: Date.now() + days * 24 * 60 * 60 * 1000
   };
   localStorage.setItem(name, JSON.stringify(item));
}
   
export function getLocalStorage(name) {
   const itemStr = localStorage.getItem(name);
   if (!itemStr) return null;
   
   const item = JSON.parse(itemStr);
   const now = Date.now();
   
   if (now > item.expiry) {
      localStorage.removeItem(name);
      return null;
   }
   return item.value;
}
   
export function removeLocalStorage(name) {
   localStorage.removeItem(name);
}