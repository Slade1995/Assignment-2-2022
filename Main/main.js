// Event bus 
var eventBus = new Vue()

// Products template called from html which displays the products.
Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true,
    }
  },
  template: `
    <div class="product">
      <div class="product-image">
        <img :src="image" :alt="alt">
      </div>

      <div class="product-info">
        <h1 class="product-title">{{ product }}</h1>
        <h2>{{ description }}</h2>

        <h3>Details</h3>
        <ul>
          <li v-for="detail in details">{{ detail}}</li>
        </ul>
        
        <h3>Variants</h3>
        <ul class="variants">
          <li v-for="(variant, index) in variants" 
              :key="variant.variantId"
              class="color-box"
              :style="{ backgroundColor: variant.variantColor }"
              @click="updateProduct(index)"
          >
            {{ variant.variantColor}}
          </li>
        </ul>

        <p>Price: $ {{price}}</p>

        <p>{{ productStatus }}</p>

        <button 
          @click="addToCart" 
          class="button"
          :class="{ '-disabled': !inStock }"
          :disabled="!inStock"
        >Add to cart</button>

        <p><small>(Shipping fee: {{ shipping }})<small></p>
      </div>

      <product-tabs :reviews="reviews"></product-tabs>

    </div>
  `,
  data() { // This part of code displays all the information for the products on the website.
    return {
      product: 'Converse shoes',
      description: 'A wide range of converse shoes available in multiple colours!',
      alt: 'Green shoes',
      selectedVariant: 0,
      inventory: 0,
      onSale: true,
      details: ["100% Real cotton canvas", "Leather styles also available", "Kids sizes available"],
      variants: [
        {
          variantId: 2234,
          variantPrice: 29.99,
          variantColor: 'green',
          variantImage: './images/green shoe.jpg',
          variantQuantity: 3,
        },
        {
          variantId: 2235,
          variantPrice: 74.99,
          variantColor: 'blue',
          variantImage: './images/blue shoe.jpg',
          variantQuantity: 12,
        },
        {
          variantId: 2236,
          variantPrice: 49.99,
          variantColor: 'red',
          variantImage: './images/red shoes.jpg',
          variantQuantity: 1,
        },
        {
          variantId: 2237,
          variantPrice: 95.99,
          variantColor: 'brown',
          variantImage: './images/brown shoe.jpg',
          variantQuantity: 8,
        },
        {
          variantId: 2238,
          variantPrice: 29.99,
          variantColor: 'purple',
          variantImage: './images/purple shoe.jpg',
          variantQuantity: 11,
        },
      ],
      classes: {
        active: true,
        '-disabled': false,
      },
      reviews: [],
    }
  },
  methods: {
    addToCart: function() {
      let cartItem = {
        product: this.product,
        variant: this.variants[this.selectedVariant].variantId,
        color: this.variants[this.selectedVariant].variantColor,
        price: this.variants[this.selectedVariant].variantPrice,
      };
      // Emitting an event by passing its name as parameter.
      this.$emit('add-to-cart', cartItem);
      // Reduce available items number.
      this.variants[this.selectedVariant].variantQuantity -= 1;
    },
    // Use ES6 shorthand syntax below instead of anonymous function.
    updateProduct(index) { 
      this.selectedVariant = index;
    }
  },
  /* if-else statement that calculates the stock on hand for a product and then displays
     the corresponding text based on the qty*/
  computed: {
    image() {
      return this.variants[this.selectedVariant].variantImage;
    },
    inStock() {
      return this.variants[this.selectedVariant].variantQuantity;
    },
    price() {
      return this.variants[this.selectedVariant].variantPrice;
    },
    productStatus() {
      const quantity = this.variants[this.selectedVariant].variantQuantity;
      if (quantity > 10) {
        return 'In stock.';
      } else if (quantity <= 10 && quantity > 1 ) {
        return `Almost sold out, only ${quantity} items are available!`;
      } else if (quantity == 1 ) {
        return `Hurry! Just 1 item is available!`;
      } else {
        return 'Out of stock. 🙁'
      }
    },
    /* calculates the shipping price and displays a message*/
    shipping() {
      if (this.premium) {
        return "Free";
      } else {
        return "$0.99";
      }
    }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview);
    }),
    /* if a cart item is deleted this will add the product back into the stock */
    eventBus.$on('cart-item-deleted', variant => {
      for (let index = 0, max = this.variants.length; index < max; index++) {
        const currentVarinat = this.variants[index];
        const variantId = currentVarinat.variantId;
        if (variantId === variant) {
          currentVarinat.variantQuantity += 1;
          return;
        }
      }
    })
  }
})

// Review template used for the review section, called from the html section.
Vue.component('add-review', {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">
      <h2>Add a review</h2>

      <p><small>Fields marked with * are required!<small></p>

      <p>
        <label for="name">Name*:</label>
        <input id="name" v-model="name">

        <label for="rating">Rating*:</label>
        <select id="rating" v-model.number="rating">
          <option>Please select!</option>
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <p>
        <label for="review">Review:</label>      
        <textarea id="review" rows="4" v-model="review"></textarea>
      </p>

      <p v-if="errors.length">
        <b>Please correct the following 
          <span v-if="errors.length == 1">error</span>
          <span v-if="errors.length > 1">errors</span>
        </b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>
          
      <p>
        <input type="submit" value="Submit">  
      </p>    
    </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: 'Please select!',
      errors: [],
    }
  },
  // this part of code relates to the review section at the bottom of the page, tells the user to enter required 
  // information before the review can be submitted
  methods: {
    onSubmit() {
      this.errors = [];
      if (this.name && this.rating !== 'Please select!') {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating
        }
        eventBus.$emit('review-submitted', productReview);
        this.$emit('review-sent');
        this.name = null;
        this.review = null;
        this.rating = 'Please select!';
      } else {
        if (!this.name) this.errors.push("Name required.");
        if (this.rating === 'Please select!') this.errors.push("Rating required."); 
      }
    }
  }
})

// Product-tabs and template pulled from html to layout the review section
Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: false
    }
  },
  template: `
    <section class="section-reviews">
      <ul class="tabs">
        <li class="tab" 
            :class="{ activeTab: selectedTab === tab }"
            v-for="(tab, index) in tabs" 
            :key="index"
            @click="selectedTab = tab">
              {{ tab }}
        </li>
      </ul>

      <div v-show="selectedTab === 'Reviews'">
        <h2>Reviews</h2>
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul class="review-list">
          <li v-for="review in reviews">
            <p>
              <span class="review__name">{{ review.name }}</span>
              <span class="review__rating">Rating: {{ review.rating }}</span>
            </p>
            <p class="review__text">{{ review.review }}</p>
          </li>
        </ul>
      </div>

      <add-review v-show="selectedTab === 'Add Review'" @review-sent="showReviews"></add-review>
    </section>
  `,
  data() {
    return {
      tabs: ['Reviews', 'Add Review'],
      selectedTab: 'Reviews' 
    }
  },
  methods: {
    showReviews() {
      this.selectedTab = 'Reviews';
    }
  }
})

// Cart-content and template called from html to layout the cart contents
Vue.component('cart-content', {
  props: {
    showCartContent: {
      type: Boolean,
      required: true,
    },
    items: {
      type: Array,
      required: false
    }
  },
  template: `
    <div v-show="showCartContent" class="cart-content">
      <button @click="hideCartContent" class="cart-content__close">Close</button>

      <h2 class="cart-content__title">Your cart</h2>

      <table v-if="items.length" class="cart-items">
        <thead class="cart-items__head">
          <tr>
            <th class="cart-items__num-label">Num.</th>
            <th class="cart-items__product-label">Item</th>
            <th class="cart-items__price-label">Price</th>
            <th class="cart-items__action">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items">
            <td>{{index + 1}}.</td>
            <td class="cart-items__product">{{item.product}} – {{item.color}}</td>
            <td class="cart-items__price">$ {{item.price}}</td>
            <td class="cart-items__action">
              <button @click="deleteItem(index, item.variant)">
                Remove
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan=2>Total:</td>
            <td class="cart-items__total">$ {{cartTotal}}</td>
            <td class="cart-items__action"></td>
          </tr>
        </tfoot>
      </table>

      <p v-else>Your cart is empty. 😞</p>
    </div>
  `,
  methods: {
    hideCartContent() {
      this.$root.showCartContent = false;
    },
    deleteItem(index, variant) {
      this.$root.cart.splice(index, 1);
      eventBus.$emit('cart-item-deleted', variant);
    }
  },
  computed: {
    cartTotal() {
      return this.items.reduce((total, item) => total + item.price, 0).toFixed(2);
    }
  }
})

// App 
var app = new Vue({ // Vue instance with options object passed as parameter.
  el: '#app',
  data: {
    premium: true,
    showCartContent: false,
    cart: [],
  },
  methods: {
    updateCart(item) {
      this.cart.push(item);
    },
    toggleCartContent() {
      this.showCartContent = !this.showCartContent;
    }
  }
})

Vue.config.devtools = true;
