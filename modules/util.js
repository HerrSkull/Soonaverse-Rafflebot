export function createRingBuffer(length){
    
    var pointer = 0, buffer = []; 
  
    return {
      get  : function(key){return buffer[key];},
      push : function(item){
        buffer[pointer] = item;
        let pos = pointer;
        pointer = (length + pointer +1) % length;
        return pos;
      },
      count : function(){
          return buffer.length;
      },
      findIndex : function(val) {
        return buffer.findIndex((element) => element === val);
      }
    };
};

export function chunk(chunkable ,chunkSize){
  let chunked = new Array();
  for (let i = 0; i < chunkable.length; i += chunkSize) {
      chunked.push(chunkable.slice(i, i + chunkSize));
  }
  return chunked
};