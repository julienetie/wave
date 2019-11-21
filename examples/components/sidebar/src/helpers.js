const template = document.createElement('template');  
const createMarkupPartial = () => {
  return string => {
    template.insertAdjacentHTML('afterbegin', string);
    return template.firstElementChild;
  }
}

const markupPartial = createMarkupPartial();


markupPartial


export {
	markupPartial
} 