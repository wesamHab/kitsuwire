import "server-only";

const value = (name: string) => process.env[name]?.trim() || null;

export function getLegalOperator() {
  const operator = {
    name: value("LEGAL_OPERATOR_NAME"),
    addressLine1: value("LEGAL_ADDRESS_LINE1"),
    postalCity: value("LEGAL_POSTAL_CITY"),
    country: value("LEGAL_COUNTRY") ?? "Germany",
    email: value("LEGAL_EMAIL"),
    phone: value("LEGAL_PHONE"),
    vatId: value("LEGAL_VAT_ID"),
    editorialResponsible: value("LEGAL_EDITORIAL_RESPONSIBLE"),
  };

  const ready = Boolean(operator.name && operator.addressLine1 && operator.postalCity && operator.email);
  return { ...operator, ready };
}
