const container = document.getElementById('container-graph')
const form = document.getElementById('container-params')

function cleanContainer() {
  Array.from(container.children).forEach(n => n.remove())
}

function genGraph(data) {
  switch (data.type) {
    case 'column':
      return genColumnGraph(data)
    case 'line':
      return genLineGraph(data)
    case '':
      return null
    default:
      throw new Error(`Unknown graph type: ${ data.type }`)
  }
}

function getFormValues() {
  const formData = {}
  Array.from(form.elements).forEach(e => {
    if (e.id) {
      formData[e.id] = e.value
    }
  })
  return formData
}

function handleApiData(json) {
  cleanContainer()

  for (const data of json) {
    const canvas = Object.assign(
      document.createElement('div'),
      { className: 'canvas' }
    )
    const caption = Object.assign(
      document.createElement('textarea'),
      { className: 'caption', innerText: data.caption }
    )

    const graphContainer = Object.assign(
      document.createElement('div'),
      { className: 'container-graph-inner' }
    )
    graphContainer.appendChild(canvas)
    graphContainer.appendChild(caption)

    const options = genGraph(data)

    if (!options) {
      canvas.style.height = '349px'
      canvas.style.width = '502px'
    }

    container.appendChild(graphContainer)

    if (options) {
      const chart = new ApexCharts(canvas, options)
      chart.render()
    }
  }
}

function catchApiErrors(body) {
  cleanContainer()

  const iframe = Object.assign(document.createElement('iframe'), { 'id': 'error' })
  container.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
  iframeDoc.body.innerHTML = body
}

function getData(endpoint) {
  /**
   *  Fetch tells browser to send a request to the flask backend on the '/data' route.
   */
  if (!endpoint) {
    alert('No endpoint provided')
    return
  }

  const params = new URLSearchParams(getFormValues())
  fetch(`/data/${ endpoint }?${ params }`).then(r => r.ok ? r.json().then(handleApiData) : r.text().then(catchApiErrors))
}
