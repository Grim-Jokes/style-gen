IDS = [
  'default',
  'primary-outline',
  'success-outline',
  'danger-outline',
  'link-outline'
]

callback = () => {
  new Retriever(IDS, 'buttons').retrieve();
}