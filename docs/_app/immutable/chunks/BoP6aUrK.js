const l=(p,n,i,a)=>{const o=JSON.parse(JSON.stringify(i.properties)),e=p.split(".");let t=o;for(let r=0;r<e.length-1;r++){const s=e[r];t[s]||(t[s]={}),t=t[s]}t[e[e.length-1]]=n,a(o)};export{l as u};
