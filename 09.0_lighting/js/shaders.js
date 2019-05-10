"use strict";

const BASIC_VERTEX = `
    attribute vec3 a_position;

    uniform mat4 u_world;
    uniform mat4 u_camera;
    uniform mat4 u_projection;

    void main () {
        gl_Position = u_projection * u_camera * u_world * vec4(a_position, 1.0);
    }
`;

const BASIC_FRAGMENT = `
    precision highp float;

    uniform vec3 u_colour;

    void main () {
        gl_FragColor = vec4(u_colour, 1.0);
    }
`;

const LIT_COLOURED_VERTEX = `
    attribute vec3 a_position;
    attribute vec3 a_colour;
    attribute vec3 a_normal;

    uniform mat4 u_world;
    uniform mat4 u_camera;
    uniform mat4 u_projection;
    uniform mat3 u_normal;

    varying vec3 v_colour;
    varying vec3 v_normal;
    varying vec3 v_cameraSpacePosition;

    void main () {
        v_colour = a_colour;
        v_normal = u_normal * a_normal;

        // We need to know where in camera space this vertex is for specular lighting.
        vec4 cameraSpace = u_camera * u_world * vec4(a_position, 1.0);
        v_cameraSpacePosition = cameraSpace.xyz;

        gl_Position = u_projection * cameraSpace;
    }
`;

const LIT_COLOURED_FRAGMENT = `
    precision highp float;

    uniform vec3 u_lightDirection;
    uniform vec3 u_lightColour;
    uniform vec3 u_ambientLight;
    uniform vec3 u_specular;
    uniform float u_specularPower;

    uniform vec4 u_colour;

    varying vec3 v_colour;
    varying vec3 v_normal;
    varying vec3 v_cameraSpacePosition;

    void main () {
        vec3 material = u_colour.rgb * v_colour;

        // We need to call normalize on the varying because after being interpolated it's length is unlikely to be exactly 1.0.
        vec3 normal = normalize(v_normal);

        // Lambert's Law for diffuse
        vec3 diffuse = u_lightColour * max(dot(normalize(normal), u_lightDirection), 0.0);

        // For specular we need to know which direction we are looking at this point from.
        // Since we are doing lighting in view/camera space, we can just negate and normalize our position to compute this.
        vec3 viewDirection = normalize(-v_cameraSpacePosition);

        // We calculate a halfway vector between the view direction and the light direction.
        vec3 halfway = normalize(viewDirection + u_lightDirection);

        // And finally compute the specular term using the Blinn-Phong model.
        vec3 specular = u_lightColour * pow(max(dot(halfway, normal), 0.0), u_specularPower);

        vec3 final = material * (u_ambientLight + diffuse) + specular;
        gl_FragColor = vec4(final, u_colour.a);
    }
`;
