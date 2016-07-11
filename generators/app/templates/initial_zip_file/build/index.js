exports.handler = function(event, context, callback)
{
    console.error('This is just a dummy temporary function');
    return callback(new Error('This is just a dummy temporary function'));
};
