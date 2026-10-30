import type { SchemaProperty } from '@/lib/schema'

function TypeTag({ prop }: { prop: SchemaProperty }) {
  const parts = [prop.format ?? prop.type]
  if (prop.nullable) parts.push('nullable')
  return (
    <span className="font-mono text-xs text-purple-700">{parts.join(' | ')}</span>
  )
}

function PropertyRow({ prop, depth }: { prop: SchemaProperty; depth: number }) {
  return (
    <>
      <tr className="border-b">
        <td className="border px-3 py-2 font-mono text-sm text-gray-900" style={{ paddingLeft: `${(depth + 1) * 12}px` }}>
          {prop.name}
          {prop.required && <span className="ml-1 text-red-500 text-xs">*</span>}
        </td>
        <td className="border px-3 py-2"><TypeTag prop={prop} /></td>
        <td className="border px-3 py-2 text-gray-500 text-xs">
          {prop.default !== undefined ? `default: ${prop.default}` : ''}
          {prop.enum ? prop.enum.map(v => <code key={v} className="mr-1 px-1 bg-gray-100 rounded">{v}</code>) : null}
        </td>
      </tr>
      {prop.properties?.map((child) => (
        <PropertyRow key={child.name} prop={child} depth={depth + 1} />
      ))}
    </>
  )
}

export function SchemaTable({ properties }: { properties: SchemaProperty[] }) {
  if (!properties.length) return <p className="text-gray-400 text-sm italic">No properties</p>
  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="border px-3 py-2 font-semibold text-gray-700">Field</th>
            <th className="border px-3 py-2 font-semibold text-gray-700">Type</th>
            <th className="border px-3 py-2 font-semibold text-gray-700">Details</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((prop) => (
            <PropertyRow key={prop.name} prop={prop} depth={0} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
