// Generate a CSV file from the data and trigger a download
export const generateCsvDownload = <T extends string>(name: string, dateRange: [Date, Date], columns: Array<[T, string]>, data: Array<Record<T, unknown>>,) => {
    const filename = `${name} ${dateRange[0].toISOString().split('T')[0]} to ${dateRange[1].toISOString().split('T')[0]}.csv`
    const csvHeaders = columns.map(([, title]) => title).join(',') + '\n'
    // Format the data as a CSV
    const csvRows = data.map(response => columns.map(([key]) => response[key]).join(',')).join('\n')
    const csv = csvHeaders + csvRows
    // Send the CSV to the browser
    const blob = new Blob([csv], {type: 'text/csv'})
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', filename)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url);
}