export default function() {
  console.log('this is demo this is demo');

  const app = document.querySelector('#app')

  const div = document.createElement('div')
  div.innerHTML = '<p>this is a div</p>'
  app.appendChild(div)
}