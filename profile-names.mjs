const defaultNames={older:'첫째',young:'둘째'};
const key='turtle-math-forest.profile-names';
const validName=value=>typeof value==='string' && /^[\p{L}\p{M}\p{N} -]{1,16}$/u.test(value);

export function profileNames(storage,fragment) {
  const names={...defaultNames};
  try {
    const stored=JSON.parse(storage.getItem(key));
    for (const id of Object.keys(names)) {
      if (validName(stored?.[id])) names[id]=stored[id];
    }
  } catch {}
  const params=new URLSearchParams(fragment.replace(/^#/,''));
  let customized=false;
  for (const id of Object.keys(names)) {
    const name=params.get(id)?.trim().normalize('NFC');
    if (validName(name)) {
      names[id]=name;
      customized=true;
    }
  }
  if (customized) {
    try {storage.setItem(key,JSON.stringify(names));} catch {}
  }
  return {names,customized};
}
