document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('body').addEventListener('mouseover', handleMouseOver);
  document.querySelector('body').addEventListener('mouseout', handleMouseOut);
  document.querySelector('#pagePrev').addEventListener('click', cycle(-1));
  document.querySelector('#pageNext').addEventListener('click', cycle(1));
  document.querySelector('#columnTitle').addEventListener('click', handleMessageClick(event));
  init();
});