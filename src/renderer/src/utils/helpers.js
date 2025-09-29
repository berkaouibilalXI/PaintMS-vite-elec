export const getArrayLength = (data) => {
    if (Array.isArray(data)) {
      return data.length;
    } else if (data && Array.isArray(data.clients)) {
      return data.clients.length;
    } else if (data && Array.isArray(data.data)) {
      return data.data.length;
    } else if (data && Array.isArray(data.products)) {
      return data.products.length;
    } else if (data && Array.isArray(data.invoices)) {
      return data.invoices.length;
    }
    return 0;
  };