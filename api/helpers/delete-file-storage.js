module.exports = {
  friendlyName: 'Delete file storage',
  description:  'Borra uno o más objetos de Supabase Storage. No falla el flujo llamador si el storage rechaza el borrado — solo lo loguea.',

  inputs: {
    files: {
      type:     'ref',
      required: true,
      description: 'Array de { bucket, name }.',
    },
  },

  exits: {
    success: { outputType: 'ref' },
  },

  fn: async function ({ files }, exits) {
    const supabase = sails.helpers.supabase();
    const byBucket = new Map();
    for (const f of files) {
      if (!f?.bucket || !f?.name) continue;
      if (!byBucket.has(f.bucket)) byBucket.set(f.bucket, []);
      byBucket.get(f.bucket).push(f.name);
    }

    for (const [bucket, names] of byBucket) {
      const { error } = await supabase.storage.from(bucket).remove(names);
      if (error) sails.log.warn('Error al eliminar de storage', bucket, names, error.message);
    }

    return exits.success();
  },
};
